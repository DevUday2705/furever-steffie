import SelectGender from "./Components/SelectGender";
import SelectStyle from "./Components/SelectStyle";
import FabricOptions from "./Components/FabricOptions";
import SelectedFabric from "./Components/SelectedFabric";
import OrderForm from "./Components/OrderForm";
import FinalReceipt from "./Components/FinalReceipt";
import ModernOptions from "./Components/ModernOptions";
import ProductDetail from "./Components/ProductDetail";
import Cart from "./Components/Cart";
import { Routes, Route, Link, useLocation } from "react-router-dom";
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
import TuxedoListing from "./Components/TuxedoListing";
import BandanaListing from "./Components/BandanaListing";
import LehengaListing from "./Components/LehengaListing";
import FrockListing from "./Components/FrockListing";
import StockManager from "./Components/StockManager";
import FabricManagementSystem from "./Components/FabricManagementSystem";
const App = () => {
  return (
    <div className=" max-w-md mx-auto ">
      <nav className="flex items-center justify-between py-5 px-5  ">
        <Link to="/" className="w-full ">
          <img className="h-12 mx-auto" src="/images/logo.png" />
        </Link>
        <CartNav />
      </nav>

      <div className="max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kurta" element={<KurtaListing />} />
          <Route path="/frock" element={<FrockListing />} />
          <Route path="/tuxedo" element={<TuxedoListing />} />
          <Route path="/bandana" element={<BandanaListing />} />
          <Route path="/lehenga" element={<LehengaListing />} />
          <Route path="/frock" element={<FrockListing />} />
          <Route path="/bow-tie" element={<BowTieCategories />} />
          <Route path="/male-bows" element={<MaleBowCategories />} />
          <Route path="/female-bows" element={<FemaleBowCategories />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/review" element={<OrderReviewPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/gender" element={<SelectGender />} />
          <Route path="/style" element={<SelectStyle />} />
          <Route path="/traditional" element={<FabricOptions />} />
          <Route path="/modern" element={<ModernOptions />} />
          <Route path="/product-detail/:id" element={<SelectedFabric />} />
          <Route path="/order-form" element={<OrderForm />} />
          <Route path="/final-receipt" element={<FinalReceipt />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/policy" element={<ShippingPolicyPage />} />
          <Route path="/terms" element={<TermsAndConditionsPage />} />
          <Route path="/cancellations" element={<CancellationsRefundsPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/inventory" element={<FabricManagementSystem />} />
          <Route path="/stock" element={<StockManager />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
