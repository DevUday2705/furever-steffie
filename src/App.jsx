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

import { Routes, Route, Link } from "react-router-dom";
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
const App = () => {
  return (
    <div className=" max-w-md mx-auto">
      <nav className="flex items-center justify-between py-5 px-5 border-b border-b-gray-200">
        {/* <CartNav /> */}
      </nav>
      <header className="sticky top-0 bg-white shadow-sm z-20">
        <div className="container mx-auto py-3">
          <SearchBar productData={productData} />
        </div>
      </header>
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
          <Route path="/love" element={<LoveMessage />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
