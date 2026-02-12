import SelectGender from "./Components/SelectGender";
import SelectStyle from "./Components/SelectStyle";
import FabricOptions from "./Components/FabricOptions";
import SelectedFabric from "./Components/SelectedFabric";
import OrderForm from "./Components/OrderForm";
import FinalReceipt from "./Components/FinalReceipt";
import ModernOptions from "./Components/ModernOptions";
import ProductDetail from "./Components/ProductDetail";

import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./Components/Home";
import OrderReviewPage from "./Components/OrderReviewPage";
import CheckoutPage from "./Components/CheckoutPage";
import ContactUsPage from "./Components/ContactUs";
import ShippingPolicyPage from "./Components/ShippingPolicyPage";
import TermsAndConditionsPage from "./Components/TermsAndConditionsPage";
import CancellationsRefundsPage from "./Components/CancellationsRefundsPage";
import PrivacyPolicy from "./Components/PrivacyPolicy";
import AdminPage from "./Components/AdminPage";
import FemaleBowCategories from "./Components/FemaleBowCategories";
import CartNav from "./Components/CartNav";
import MaleBowCategories from "./Components/MaleBowCategories";
import ThankYouPage from "./Components/ThankYouPage";
import BowTieCategories from "./Components/BowTieCategories";

import KurtaListing from "./Components/KurtaListing";
import PathaniListing from "./Components/PathaniListing";
import TuxedoListing from "./Components/TuxedoListing";

import LehengaListing from "./Components/LehengaListing";
import FrockListing from "./Components/FrockListing";
import StockManager from "./Components/StockManager";
import FabricManagementSystem from "./Components/FabricManagementSystem";
import { useContext } from "react";
import { CurrencyContext } from "./context/currencyContext";
import CurrencySelector from "./Components/CurrencySelector";
import { Search } from "lucide-react";
import HamburgerMenu from "./Components/HamburgerMenu";
import TrackOrder from "./Components/TrackOrder";
import UploadKurtasPage from "./Components/UploadKurtasPage";
import UniversalSearchBar from "./Components/UniversalSearch";
import ProductForm from "./Components/ProductForm";
import AdminHome from "./Components/AdminHome";
import GlobalSettings from "./Components/GlobalSettings";
import DhotiManagement from "./Components/DhotiManagement";
import InternationalPaymentPage from "./Components/InternationalPaymentPage";
import OrderUtility from "./Components/OrderUtility";
import OrderPauseModal from "./Components/OrderPauseModal";
import { useState, useEffect } from "react";
import { useOrderPause } from "./context/OrderPauseContext";
import { initializeOrderPauseSettings } from "./utils/orderPauseUtils";
import WhyUs from "./Components/WhyUs";
import AboutUs from "./Components/AboutUs";
import AdminProducts from "./Components/AdminProducts";
import TutuListing from "./Components/TutuListing";
import ComingSoonPage from "./Components/ComingSoon";
import FemaleBandanas from "./Components/BandanaListing";
import MaleBandanas from "./Components/MaleBandanas";
import DailyTaskSheet from "./Components/TaskSheet";
import PaymentFailed from "./Components/PaymentFailed";
import EmailTest from "./Components/EmailTest";
import WhatsAppTest from "./Components/WhatsAppTest";
import SizeGuide from "./Components/SizeGuide";
import PopupPoster from "./Components/PopupPoster";
const App = () => {
  const { currency, setCurrency } = useContext(CurrencyContext);
  const { ordersArePaused } = useOrderPause();
  const navigate = useNavigate();
  const location = useLocation();
  const ready = true; // Set to false to show coming soon for non-admin pages

  // Initialize Firebase order pause settings on app start
  useEffect(() => {
    initializeOrderPauseSettings();
  }, []);

  // Order pause modal state
  const [showOrderPauseModal, setShowOrderPauseModal] = useState(false);

  // Check for order pause on certain routes (product pages, checkout)
  const orderRelatedRoutes = ["/product/", "/checkout", "/cart"];
  const isOrderRelatedRoute = orderRelatedRoutes.some((route) =>
    location.pathname.includes(route)
  );

  // Show modal when user tries to access order-related pages
  useEffect(() => {
    if (ordersArePaused && isOrderRelatedRoute && !showOrderPauseModal) {
      setShowOrderPauseModal(true);
    }
  }, [
    location.pathname,
    ordersArePaused,
    isOrderRelatedRoute,
    showOrderPauseModal,
  ]);

  // Admin routes that should always be accessible
  const adminRoutes = [
    "/admin",
    "/inventory",
    "/stock",
    "/admin/orders",
    "/admin/product",
    "/admin/add",
    "/admin/edit",
    "/daily-task",
    "/test-email",
    "/test-whatsapp",
  ];

  // Check if current route is admin route
  const isAdminRoute = adminRoutes.some((route) =>
    location.pathname.startsWith(route)
  );
  return (
    <div className=" max-w-md mx-auto ">
      {ready || isAdminRoute ? (
        <>
          <nav className="flex items-center justify-between px-4 py-3 sticky top-0 z-[70] bg-white">
            {/* Left: Hamburger & Search */}
            <div className="flex items-center gap-1 min-w-[100px] justify-start">
              <HamburgerMenu />
              <Search
                className="cursor-pointer"
                onClick={() => {
                  navigate("/search");
                }}
                size={20}
              />
            </div>

            {/* Center: Logo */}
            <div className="flex justify-center flex-1">
              <Link to="/">
                <img className="h-9" src="/images/logo.png" alt="Logo" />
              </Link>
            </div>

            {/* Right: Currency & Cart */}
            <div className="flex items-center gap-3 min-w-[100px] justify-end">
              <CurrencySelector currency={currency} setCurrency={setCurrency} />
              <CartNav />
            </div>
          </nav>

          <div className="max-w-md mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/kurta" element={<KurtaListing />} />
              <Route path="/pathani" element={<PathaniListing />} />
              <Route path="/frock" element={<FrockListing />} />
              <Route path="/tuxedo" element={<TuxedoListing />} />
              <Route path="/pathani" element={<PathaniListing />} />
              <Route path="/female-bandanas" element={<FemaleBandanas />} />
              <Route path="/male-bandanas" element={<MaleBandanas />} />
              <Route path="/lehenga" element={<LehengaListing />} />
              <Route path="/tutu-dress" element={<TutuListing />} />
              <Route path="/bow-tie" element={<BowTieCategories />} />
              <Route path="/male-bows" element={<MaleBowCategories />} />
              <Route path="/female-bows" element={<FemaleBowCategories />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/review" element={<OrderReviewPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route
                path="/international-payment"
                element={<InternationalPaymentPage />}
              />
              <Route path="/gender" element={<SelectGender />} />
              <Route path="/style" element={<SelectStyle />} />
              <Route path="/traditional" element={<FabricOptions />} />
              <Route path="/modern" element={<ModernOptions />} />
              <Route path="/product-detail/:id" element={<SelectedFabric />} />
              <Route path="/order-form" element={<OrderForm />} />
              <Route path="/final-receipt" element={<FinalReceipt />} />

              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/why-us" element={<WhyUs />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/policy" element={<ShippingPolicyPage />} />
              <Route path="/terms" element={<TermsAndConditionsPage />} />
              <Route
                path="/cancellations"
                element={<CancellationsRefundsPage />}
              />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/orders" element={<AdminPage />} />
              <Route path="/admin/product" element={<AdminProducts />} />
              <Route path="/admin/settings" element={<GlobalSettings />} />
              <Route path="/admin/dhotis" element={<DhotiManagement />} />
              <Route path="/admin/add/:category" element={<ProductForm />} />
              <Route path="/order-utility" element={<OrderUtility />} />
              <Route path="/daily-task" element={<DailyTaskSheet />} />
              <Route path="/test-email" element={<EmailTest />} />
              <Route path="/test-whatsapp" element={<WhatsAppTest />} />
              <Route path="/size-guide" element={<SizeGuide />} />

              <Route
                path="/admin/edit/:category/:id"
                element={<ProductForm />}
              />
              <Route path="/payment-failed" element={<PaymentFailed />} />
            </Routes>
          </div>
        </>
      ) : (
        <ComingSoonPage />
      )}
      {/* {(ready || isAdminRoute) && location.pathname === "/" ? (
        <PopupPoster />
      ) : null} */}

      {/* Order Pause Modal */}
      <OrderPauseModal
        isOpen={showOrderPauseModal}
        onClose={() => {
          setShowOrderPauseModal(false);
          // Redirect to home when modal is closed
          if (isOrderRelatedRoute) {
            navigate("/");
          }
        }}
      />

      <Toaster />
    </div>
  );
};

export default App;
