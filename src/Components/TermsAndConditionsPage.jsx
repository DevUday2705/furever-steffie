import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  // Table of contents sections
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "services", title: "Services" },
    { id: "account", title: "User Account" },
    { id: "replacement", title: "Replacement & Exchange Policy" },
    { id: "intellectual", title: "Intellectual Property" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "privacy", title: "Privacy & Data" },
    { id: "payment", title: "Payment Terms" },
    { id: "termination", title: "Termination" },
    { id: "governing", title: "Governing Law" },
    { id: "changes", title: "Changes to Terms" },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Terms and Conditions
          </h1>
          <p className="text-lg text-gray-600">Last updated: April 8, 2025</p>
        </motion.div>

        <div className="flex flex-col gap-8 ">
          {/* Table of Contents - Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6 w-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Table of Contents
              </h2>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        activeSection === section.id
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-grow"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Introduction */}
              <motion.section
                id="introduction"
                variants={itemVariants}
                className="mb-10"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                  1. Introduction
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>
                    Welcome to our website. These Terms and Conditions govern
                    your use of our website and services, including any content,
                    functionality, and services offered on or through our
                    website.
                  </p>
                  <p>
                    By accessing or using our website, you agree to be bound by
                    these Terms and Conditions. If you do not agree with any
                    part of these terms, you may not access the website or use
                    our services.
                  </p>
                  <p>
                    Please read these Terms and Conditions carefully before
                    using our website. These terms constitute a legally binding
                    agreement between you and our company.
                  </p>
                </div>
              </motion.section>

              {/* Services */}
              <motion.section
                id="services"
                variants={itemVariants}
                className="mb-10"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                  2. Services
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>
                    Our company provides various services and products as
                    described on our website. We reserve the right to modify,
                    suspend, or discontinue any aspect of our services at any
                    time without notice or liability.
                  </p>
                  <p>
                    All services and products are subject to availability.
                    Prices for our products and services are subject to change
                    without notice. We reserve the right to limit quantities of
                    any products or services that we offer.
                  </p>
                  <p>
                    We make every effort to display as accurately as possible
                    the colors and images of our products. We cannot guarantee
                    that your computer monitor's display of any color will be
                    accurate.
                  </p>
                </div>
              </motion.section>

              {/* User Account */}
              <motion.section
                id="account"
                variants={itemVariants}
                className="mb-10"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                  3. User Account
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>
                    To access certain features of our website or services, you
                    may be required to create an account. You are responsible
                    for maintaining the confidentiality of your account and
                    password and for restricting access to your computer.
                  </p>
                  <p>
                    You agree to accept responsibility for all activities that
                    occur under your account. You must notify us immediately of
                    any unauthorized use of your account or any other breach of
                    security.
                  </p>
                  <p>
                    We reserve the right to refuse service, terminate accounts,
                    remove or edit content, or cancel orders at our sole
                    discretion.
                  </p>
                </div>
              </motion.section>

              {/* Replacement & Exchange Policy */}
              <motion.section
                id="replacement"
                variants={itemVariants}
                className="mb-10"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <ShieldCheck className="w-6 h-6 mr-2 text-green-600" />
                  4. Replacement & Exchange Policy
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Size Exchange Guarantee</h3>
                  <p>
                    We offer a hassle-free size exchange policy to ensure you get the perfect fit for your furry friend. 
                    If the size doesn't fit properly, we will provide a replacement at no additional cost.
                  </p>
                  
                  <h3 className="text-lg font-medium text-gray-800 mb-3 mt-6">Exchange Process & Timeline</h3>
                  <ul className="space-y-2">
                    <li>• Exchange requests must be initiated within <strong>7 days</strong> of delivery</li>
                    <li>• Products must be in original condition with all tags attached</li>
                    <li>• Custom-made items with specific measurements cannot be exchanged unless there's a manufacturing defect</li>
                    <li>• Replacement will be shipped within 3-5 business days of receiving the returned item</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-800 mb-3 mt-6">Return Shipping Policy</h3>
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4">
                    <div className="flex">
                      <AlertTriangle className="w-5 h-5 text-amber-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-amber-800 font-medium">Important Notice:</p>
                        <p className="text-amber-700">
                          The customer is responsible for bearing the cost of returning the product to us. 
                          We recommend using a trackable shipping method for your protection.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-800 mb-3 mt-6">Measurement Requirements</h3>
                  <p>
                    To ensure accurate sizing and reduce the need for exchanges, customers must provide pet measurements within 
                    <strong> 24 hours of placing the order</strong>. Failure to provide measurements may result in order delays or cancellation.
                  </p>

                  <h3 className="text-lg font-medium text-gray-800 mb-3 mt-6">Quality Assurance</h3>
                  <p>
                    All products are carefully inspected before shipping. In the rare case of a manufacturing defect or 
                    damage during shipping, we will provide a full replacement or refund at no cost to the customer, 
                    including return shipping.
                  </p>

                  <h3 className="text-lg font-medium text-gray-800 mb-3 mt-6">Contact for Exchanges</h3>
                  <p>
                    To initiate an exchange, please contact our customer service team with your order number and 
                    photos of the product. We're here to help ensure you and your pet are completely satisfied with your purchase.
                  </p>
                </div>
              </motion.section>

              {/* Intellectual Property */}
              <motion.section
                id="intellectual"
                variants={itemVariants}
                className="mb-10"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <ShieldCheck className="w-6 h-6 mr-2 text-blue-600" />
                  5. Intellectual Property
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>
                    The content, features, and functionality of our website,
                    including but not limited to text, graphics, logos, icons,
                    images, audio clips, digital downloads, and software, are
                    owned by our company, its licensors, or other providers and
                    are protected by copyright, trademark, and other
                    intellectual property laws.
                  </p>
                  <p>
                    You may not use, reproduce, distribute, modify, create
                    derivative works of, publicly display, publicly perform,
                    republish, download, store, or transmit any of the material
                    on our website, except as generally necessary for using the
                    website for its intended purpose.
                  </p>
                  <p>
                    Any use of our intellectual property without express written
                    permission is strictly prohibited and may result in legal
                    action.
                  </p>
                </div>
              </motion.section>

              {/* Limitation of Liability */}
              <motion.section
                id="liability"
                variants={itemVariants}
                className="mb-10"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-blue-600" />
                  6. Limitation of Liability
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>
                    In no event shall our company, its directors, employees,
                    partners, agents, suppliers, or affiliates be liable for any
                    indirect, incidental, special, consequential, or punitive
                    damages, including without limitation, loss of profits,
                    data, use, goodwill, or other intangible losses.
                  </p>
                  <p>
                    We do not warrant that our website will be uninterrupted or
                    error-free, that defects will be corrected, or that our
                    website or the server that makes it available are free of
                    viruses or other harmful components.
                  </p>
                  <p>
                    To the maximum extent permitted by applicable law, our total
                    liability to you for any damages shall not exceed the amount
                    paid by you, if any, for accessing our website or using our
                    services.
                  </p>
                </div>
              </motion.section>

              {/* Privacy & Data */}
              <motion.section
                id="privacy"
                variants={itemVariants}
                className="mb-10"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <ShieldCheck className="w-6 h-6 mr-2 text-blue-600" />
                  7. Privacy & Data
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>
                    Your use of our website and services is also governed by our
                    Privacy Policy, which outlines how we collect, use, and
                    protect your personal information.
                  </p>
                  <p>
                    By using our website, you consent to the collection and use
                    of information as described in our Privacy Policy. We are
                    committed to protecting your privacy and ensuring the
                    security of your personal information.
                  </p>
                  <p>
                    We may use cookies and similar tracking technologies to
                    enhance your experience on our website. You may disable
                    cookies in your browser settings, but doing so may affect
                    certain features of our website.
                  </p>
                </div>
              </motion.section>

              {/* Payment Terms */}
              <motion.section
                id="payment"
                variants={itemVariants}
                className="mb-10"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                  8. Payment Terms
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>
                    All prices are in the currency indicated on our website and
                    are subject to change without notice. Payment must be made
                    in full before the delivery of products or services.
                  </p>
                  <p>
                    We accept various payment methods as indicated on our
                    website. By providing payment information, you represent and
                    warrant that you have the legal right to use the payment
                    method you provide.
                  </p>
                  <p>
                    All payment information is processed securely by our payment
                    processors. We do not store your payment details on our
                    servers.
                  </p>
                </div>
              </motion.section>

              {/* Termination */}
              <motion.section
                id="termination"
                variants={itemVariants}
                className="mb-10"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-blue-600" />
                  9. Termination
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>
                    We may terminate or suspend your account and access to our
                    services immediately, without prior notice or liability, for
                    any reason, including if you breach these Terms and
                    Conditions.
                  </p>
                  <p>
                    Upon termination, your right to use our services will
                    immediately cease. All provisions of these Terms which by
                    their nature should survive termination shall survive,
                    including ownership provisions, warranty disclaimers,
                    indemnity, and limitations of liability.
                  </p>
                </div>
              </motion.section>

              {/* Governing Law */}
              <motion.section
                id="governing"
                variants={itemVariants}
                className="mb-10"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <ShieldCheck className="w-6 h-6 mr-2 text-blue-600" />
                  10. Governing Law
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>
                    These Terms and Conditions shall be governed by and
                    construed in accordance with the laws of India, without
                    regard to its conflict of law provisions.
                  </p>
                  <p>
                    Any dispute arising from or relating to these Terms and
                    Conditions shall be subject to the exclusive jurisdiction of
                    the courts in the relevant jurisdiction.
                  </p>
                  <p>
                    If any provision of these Terms is held to be invalid or
                    unenforceable, such provision shall be struck and the
                    remaining provisions shall be enforced to the fullest extent
                    under law.
                  </p>
                </div>
              </motion.section>

              {/* Changes to Terms */}
              <motion.section
                id="changes"
                variants={itemVariants}
                className="mb-10"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-blue-600" />
                  11. Changes to Terms
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>
                    We reserve the right to modify these Terms and Conditions at
                    any time. Changes will be effective immediately upon posting
                    on our website. Your continued use of our website following
                    the posting of revised Terms and Conditions constitutes your
                    acceptance of such changes.
                  </p>
                  <p>
                    We will make reasonable efforts to notify users of any
                    significant changes to these Terms and Conditions through
                    notices on our website or by email.
                  </p>
                  <p>
                    It is your responsibility to review these Terms and
                    Conditions periodically to stay informed of updates.
                  </p>
                </div>
              </motion.section>

              {/* Contact Information */}
              <motion.section
                variants={itemVariants}
                className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Contact Information
                </h2>
                <p className="text-gray-700">
                  If you have any questions or concerns about these Terms and
                  Conditions, please contact us:
                </p>
                <div className="mt-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> fureversteffie@gmail.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Phone:</strong> +917042212942
                  </p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> Bharat Apartment, 302, Shivsena
                    galli, Near Khau galli bhayandar west
                  </p>
                </div>
              </motion.section>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-8 text-center text-gray-600 text-sm"
            >
              <p>© 2025 All Rights Reserved</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
