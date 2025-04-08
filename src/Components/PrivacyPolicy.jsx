import React from "react";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Scroll to section function
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 text-gray-800 font-sans">
      {/* Header with paw print background */}
      <motion.header
        className="bg-amber-600 py-10 px-4 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="flex flex-wrap">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-16 h-16 m-4 bg-white rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.5 }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h1
            className="text-4xl font-bold text-white text-center mb-4"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            className="text-xl text-amber-100 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Furever Steffie | Dog Clothing With Love
          </motion.p>
        </div>
      </motion.header>

      {/* Table of Contents */}
      <motion.div
        className="bg-white shadow-md rounded-lg mx-4 md:mx-auto max-w-4xl -mt-8 p-6 mb-8 relative z-20"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-amber-800">
          Quick Navigation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { title: "Information Collection", id: "collection" },
            { title: "Information Usage", id: "usage" },
            { title: "Information Protection", id: "protection" },
            { title: "Cookies Policy", id: "cookies" },
            { title: "Third-Party Disclosure", id: "third-party" },
            { title: "Your Rights", id: "rights" },
          ].map((item, index) => (
            <motion.button
              key={index}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 py-2 px-4 rounded transition-colors duration-300 text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollToSection(item.id)}
            >
              {item.title}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.main
        className="max-w-4xl mx-auto px-4 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section
          variants={itemVariants}
          className="mb-12 bg-white p-6 rounded-lg shadow-md"
          id="collection"
        >
          <h2 className="text-2xl font-bold mb-4 text-amber-800">
            Information Collection
          </h2>
          <p className="mb-4">
            At Furever Steffie, we collect information that you provide directly
            to us when you:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Create an account or place an order</li>
            <li>Contact our customer service</li>
            <li>Sign up for our newsletter</li>
            <li>Participate in contests, surveys, or promotions</li>
          </ul>
          <p>
            This information may include your name, email address, postal
            address, phone number, payment information, and your pet's details
            such as breed, size, and preferences.
          </p>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="mb-12 bg-white p-6 rounded-lg shadow-md"
          id="usage"
        >
          <h2 className="text-2xl font-bold mb-4 text-amber-800">
            Information Usage
          </h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Send you order confirmations and updates</li>
            <li>Respond to your comments and questions</li>
            <li>Personalize your shopping experience</li>
            <li>Send you marketing communications (if you've opted in)</li>
            <li>Improve our website, products, and services</li>
          </ul>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="mb-12 bg-white p-6 rounded-lg shadow-md"
          id="protection"
        >
          <h2 className="text-2xl font-bold mb-4 text-amber-800">
            Information Protection
          </h2>
          <p className="mb-4">
            We implement a variety of security measures to maintain the safety
            of your personal information:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Secure socket layer (SSL) encryption for all transactions</li>
            <li>Regular security assessments</li>
            <li>
              Limited access to personal information by staff on a need-to-know
              basis
            </li>
            <li>
              Physical, electronic, and procedural safeguards in compliance with
              federal regulations
            </li>
          </ul>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="mb-12 bg-white p-6 rounded-lg shadow-md"
          id="cookies"
        >
          <h2 className="text-2xl font-bold mb-4 text-amber-800">
            Cookies Policy
          </h2>
          <p className="mb-4">
            Our website uses cookies to enhance your browsing experience. These
            cookies help us:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Remember your preferences</li>
            <li>Keep track of items in your shopping cart</li>
            <li>Understand how you use our website</li>
            <li>Improve our website and services</li>
          </ul>
          <p>
            You can choose to disable cookies through your browser settings,
            although this may affect your ability to use certain features of our
            website.
          </p>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="mb-12 bg-white p-6 rounded-lg shadow-md"
          id="third-party"
        >
          <h2 className="text-2xl font-bold mb-4 text-amber-800">
            Third-Party Disclosure
          </h2>
          <p className="mb-4">
            We do not sell, trade, or otherwise transfer your personally
            identifiable information to outside parties except in the following
            cases:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              Trusted third parties who assist us in operating our website,
              conducting our business, or servicing you
            </li>
            <li>When required by law to comply with legal processes</li>
            <li>
              To protect our rights, property, or safety, or the rights,
              property, or safety of others
            </li>
          </ul>
          <p>
            Non-personally identifiable visitor information may be provided to
            other parties for marketing, advertising, or other uses.
          </p>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="mb-12 bg-white p-6 rounded-lg shadow-md"
          id="rights"
        >
          <h2 className="text-2xl font-bold mb-4 text-amber-800">
            Your Rights
          </h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt out of marketing communications</li>
            <li>Object to the processing of your information</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us using the
            information provided below.
          </p>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-2xl font-bold mb-4 text-amber-800">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact
            us:
          </p>
          <div className="bg-amber-100 p-4 rounded-lg">
            <p className="font-semibold mb-1">Furever Steffie</p>
            <p className="mb-1">Email: privacy@fureversteffie.com</p>
            <p className="mb-1">Phone: (123) 456-7890</p>
            <p>Address: 123 Paw Avenue, Dogtown, CA 90210</p>
          </div>
        </motion.section>
      </motion.main>

      {/* Footer */}
      <motion.footer
        className="bg-amber-800 text-amber-100 py-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-2">
            © {new Date().getFullYear()} Furever Steffie. All rights reserved.
          </p>
          <p className="text-sm">Last updated: April 8, 2025</p>
        </div>
      </motion.footer>
    </div>
  );
}
