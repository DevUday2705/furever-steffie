import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContactUsPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to a server
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="sticky top-[60px] z-[50] bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Contact Us</h1>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-md mx-auto pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-8 text-center">
            <div className="mb-4">
              <Mail className="w-12 h-12 mx-auto text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Get in Touch</h2>
            <p className="text-lg opacity-90 leading-relaxed">
              We&apos;d love to hear from you and help with your pet&apos;s
              perfect outfit
            </p>
          </div>
          <div className="absolute -bottom-1 left-0 right-0 h-8 bg-white rounded-t-3xl"></div>
        </div>

        {/* Contact Information */}
        <div className="px-6 -mt-4 relative z-10">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Phone
                  </h3>
                  <a
                    href="tel:+918828145667"
                    className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    +91 8828145667
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Email
                  </h3>
                  <a
                    href="mailto:fureversteffie@gmail.com"
                    className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    fureversteffie@gmail.com
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Address
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Bharat Apartment, 302, Shivsena galli,
                    <br />
                    Near Khau galli bhayandar west
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-6 mt-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 resize-none"
                  placeholder="How can we help you with your pet's outfit?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-6 rounded-xl font-medium hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center"
                >
                  ✅ Thank you! Your message has been sent successfully.
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>

        {/* Quick Contact Options */}
        <div className="px-6 mt-8">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl text-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-center mb-6">
              Quick Contact
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <a
                href={`https://wa.me/918828145667?text=${encodeURIComponent(
                  "Hi! I'm interested in your pet outfits. Can you help me?"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105"
              >
                <img
                  src="/images/whatsApp.png"
                  className="h-8 w-8 mx-auto mb-2 invert"
                  alt="WhatsApp"
                />
                <div className="text-sm font-medium">WhatsApp</div>
              </a>
              <a
                href="https://www.instagram.com/furever_steffie/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105"
              >
                <img
                  src="/images/Instagram.png"
                  className="h-8 w-8 mx-auto mb-2 invert"
                  alt="Instagram"
                />
                <div className="text-sm font-medium">Instagram</div>
              </a>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="px-6 mt-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Business Hours
            </h3>
            <div className="space-y-2 text-gray-600">
              <p className="text-sm">Monday - Saturday: 10:00 AM - 8:00 PM</p>
              <p className="text-sm">Sunday: 11:00 AM - 6:00 PM</p>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              We typically respond within 2-4 hours during business hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
