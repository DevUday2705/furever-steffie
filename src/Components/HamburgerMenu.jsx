import React, { useState } from "react";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const menuItems = [
    {
      title: "Home",
      items: [],
    },
    {
      title: "Male",
      items: ["Kurta", "Tuxedo", "Bandana", "Bow tie"],
    },
    {
      title: "Female",
      items: ["Frock", "Tutu Dress", "Female Bandanas", "Bow tie"],
    },
    {
      title: "Contact Us",
      items: [],
    },
    {
      title: "About Us",
      items: [],
    },
    {
      title: "Why Us?",
      items: [],
    },
    {
      title: "Size Guide",
      items: [],
    },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveSubmenu(null);
    }
  };

  const toggleSubmenu = (index) => {
    if (menuItems[index].items.length > 0) {
      setActiveSubmenu(activeSubmenu === index ? null : index);
    }
  };

  const navigate = useNavigate();

  const handleItemClick = (item) => {
    console.log("Clicked:", item);

    // Convert to lowercase and replace spaces with hyphens for URL routing
    const routePath = item.toLowerCase().replace(/\s+/g, "-");
    console.log("female-bandana", routePath);
    switch (routePath) {
      case "home":
        navigate("/");
        break;
      case "contact-us":
        navigate("/contact");
        break;
      case "about-us":
        navigate("/about-us");
        break;
      case "why-us?":
        navigate("/why-us");
        break;
      // Male items
      case "kurta":
        navigate("/kurta");
        break;
      case "tuxedo":
        navigate("/tuxedo");
        break;
      case "bandana":
        navigate("/bandana");
        break;
      case "bow-tie":
        navigate("/bow-tie");
        break;
      // Female items
      case "frock":
        navigate("/frock");
        break;
      case "tutu-dress":
        navigate("/tutu-dress");
        break;
      case "female-bandanas":
        navigate("/female-bandanas");
        break;
      case "bow-set":
        navigate("/bow-tie");
        break;
      case "size-guide":
        navigate("/size-guide");
        break;

      default:
        // Optionally handle other routes or log
        console.log("No route defined for:", item);
        break;
    }

    setIsOpen(false); // Close the menu after navigation
  };
  return (
    <>
      {/* Menu Button */}
      <div className="relative z-50 mr-3">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Toggle menu"
        >
          <div className="relative w-6 h-6">
            <Menu
              size={24}
              className={`absolute inset-0 transition-all duration-300 transform ${
                isOpen ? "rotate-180 opacity-0" : "rotate-0 opacity-100"
              }`}
            />
            <X
              size={24}
              className={`absolute inset-0 transition-all duration-300 transform ${
                isOpen ? "rotate-0 opacity-100" : "rotate-180 opacity-0"
              }`}
            />
          </div>
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-500 z-40 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleMenu}
      />

      {/* Menu Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-all duration-500 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col h-full overflow-y-auto pb-20">
          <nav className="flex-1 p-4">
            {menuItems.map((menuItem, index) => (
              <div
                key={index}
                className="mb-2"
                style={{
                  animation: isOpen
                    ? `slideInStagger 0.6s ease-out ${index * 0.1}s both`
                    : "none",
                }}
              >
                {/* Main Menu Item */}
                <button
                  onClick={() => {
                    if (menuItem.items.length > 0) {
                      toggleSubmenu(index);
                    } else {
                      handleItemClick(menuItem.title);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-300 group transform hover:scale-[1.02] ${
                    activeSubmenu === index
                      ? "bg-gradient-to-r from-gray-50 to-gray-50 text-gray-700 shadow-lg scale-[1.02]"
                      : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <span className="font-medium text-lg">{menuItem.title}</span>
                  {menuItem.items.length > 0 && (
                    <div className="transition-transform duration-300">
                      {activeSubmenu === index ? (
                        <ChevronDown
                          size={20}
                          className="transform rotate-0 transition-transform duration-300"
                        />
                      ) : (
                        <ChevronRight
                          size={20}
                          className="group-hover:translate-x-1 transition-transform duration-300"
                        />
                      )}
                    </div>
                  )}
                </button>

                {/* Submenu */}
                {menuItem.items.length > 0 && (
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      activeSubmenu === index
                        ? "max-h-96 opacity-100 mt-2"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-4 space-y-1">
                      {menuItem.items.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => handleItemClick(subItem)}
                          className="w-full text-left p-3 rounded-lg text-gray-600 hover:text-gray-600 hover:bg-gray-50 transition-all duration-300 transform hover:translate-x-2 hover:shadow-md hover:scale-[1.02]"
                          style={{
                            animation:
                              activeSubmenu === index
                                ? `slideInSubmenu 0.4s ease-out ${
                                    subIndex * 0.1
                                  }s both`
                                : "none",
                            opacity: activeSubmenu === index ? 1 : 0,
                          }}
                        >
                          <span className="text-sm font-medium relative">
                            {subItem}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-600 transition-all duration-300 group-hover:w-full"></span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Need help?</p>
              <button className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-600 text-white rounded-lg hover:from-gray-700 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
