import SelectGender from "./Components/SelectGender";
import SelectStyle from "./Components/SelectStyle";
import FabricOptions from "./Components/FabricOptions";
import SelectedFabric from "./Components/SelectedFabric";
import OrderForm from "./Components/OrderForm";
import FinalReceipt from "./Components/FinalReceipt";
import ModernOptions from "./Components/ModernOptions";
import KurtaCategories from "./Components/KurtaCategories";
import SolidKurtasListing from "./Components/SolidKurtasListing";
import ProductDetail from "./Components/ProductDetail";
import Cart from "./Components/Cart";

import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./Components/Home";
import PrintedKurtasListing from "./Components/PrintedKurtasListing";
import BrocadeKurtasListing from "./Components/BrocadeKurtasListing";
import FullWorkKurtasListing from "./Components/FullWorkKurtasListing";
import OrderReviewPage from "./Components/OrderReviewPage";
import CheckoutPage from "./Components/CheckoutPage";
import UPIPayment from "./Components/UPIPayment";
import LoveMessage from "./Components/LoveMessage";
import SearchBar from "./Components/SearchBar";
import { productData } from "../src/constants/constant";
import ContactUsPage from "./Components/ContactUs";
import ShippingPolicyPage from "./Components/ShippingPolicyPage";
import TermsAndConditionsPage from "./Components/TermsAndConditionsPage";
import CancellationsRefundsPage from "./Components/CancellationsRefundsPage";
import PrivacyPolicy from "./Components/PrivacyPolicy";
import AdminPage from "./Components/AdminPage";
import TestPay from "./Components/TestPay";
const App = () => {
  const location = useLocation();

  // Pages where SearchBar should be hidden
  const hideSearchBarOn = ["/checkout", "/payment", "/final-receipt", "/admin"];

  // Check if current path is in the hideSearchBarOn array
  const shouldShowSearchBar = !hideSearchBarOn.includes(location.pathname);

  return (
    <div className=" max-w-md mx-auto">
      <nav className="flex items-center justify-between py-5 px-5 border-b border-b-gray-200">
        <Link to="/" className="w-full ">
          <img className="h-12 mx-auto" src="/images/logo.png" />
        </Link>
      </nav>
      {shouldShowSearchBar && (
        <header className="sticky top-0 bg-white  z-20">
          <div className="container mx-auto py-3">
            <SearchBar productData={productData} />
          </div>
        </header>
      )}
      <div className="max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kurta" element={<KurtaCategories />} />
          <Route path="/solid-kurtas" element={<SolidKurtasListing />} />
          <Route path="/printed-kurtas" element={<PrintedKurtasListing />} />
          <Route path="/brocade-kurtas" element={<BrocadeKurtasListing />} />
          <Route path="/full-work-kurtas" element={<FullWorkKurtasListing />} />
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
          <Route path="/payment" element={<UPIPayment />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/policy" element={<ShippingPolicyPage />} />
          <Route path="/terms" element={<TermsAndConditionsPage />} />
          <Route path="/cancellations" element={<CancellationsRefundsPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/pay" element={<TestPay />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
