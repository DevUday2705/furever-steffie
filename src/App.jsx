import SelectPet from "./Components/SelectPet";
import SelectGender from "./Components/SelectGender";
import SelectStyle from "./Components/SelectStyle";
import FabricOptions from "./Components/FabricOptions";
import SelectedFabric from "./Components/SelectedFabric";
import OrderForm from "./Components/OrderForm";
import FinalReceipt from "./Components/FinalReceipt";
import ModernOptions from "./Components/ModernOptions";
import Cart from "./Components/Cart";
import CartNav from "./Components/CartNav";

import { Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className=" max-w-md mx-auto">
      <nav className="flex items-center justify-between py-5 px-5 border-b border-b-gray-200">
        <Link to="/">
          <img src="/images/logo.jpg" className="h-8" alt="logo" />
        </Link>
        {/* <CartNav /> */}
      </nav>
      <div className="px-10 max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<SelectPet />} />
          <Route path="/gender" element={<SelectGender />} />
          <Route path="/style" element={<SelectStyle />} />
          <Route path="/traditional" element={<FabricOptions />} />
          <Route path="/modern" element={<ModernOptions />} />
          <Route path="/product-detail/:id" element={<SelectedFabric />} />
          <Route path="/order-form" element={<OrderForm />} />
          <Route path="/final-receipt" element={<FinalReceipt />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
