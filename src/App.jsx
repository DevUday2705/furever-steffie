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
import { useContext } from "react";
import { CurrencyContext } from "./context/currencyContext";
import CurrencySelector from "./Components/CurrencySelector";
import { Menu, Search } from "lucide-react";
import HamburgerMenu from "./Components/HamburgerMenu";
import TrackOrder from "./Components/TrackOrder";
const App = () => {
  const { currency, setCurrency } = useContext(CurrencyContext);

  return (
    <div className=" max-w-md mx-auto ">
      <nav className="flex items-center  justify-between py-5 px-2">
        <div className="flex items-center space-x-2 flex-1">
          <HamburgerMenu />
          <Search size={20} />
        </div>
        <div className="flex-1 flex justify-center">
          <Link to="/">
            <img className="h-9 shrink-0 mr-2" src="/images/logo.png" />
          </Link>
        </div>
        <div className="flex-1 flex justify-end items-center gap-2">
          <CurrencySelector currency={currency} setCurrency={setCurrency} />
          <CartNav />
        </div>
      </nav>
      <div className="max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kurta" element={<KurtaListing />} />
          <Route path="/frock" element={<FrockListing />} />
          <Route path="/tuxedo" element={<TuxedoListing />} />
          <Route path="/bandana" element={<BandanaListing />} />
          <Route path="/lehenga" element={<LehengaListing />} />
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
          <Route path="/track" element={<TrackOrder />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
