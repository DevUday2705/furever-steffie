import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { OrderPauseProvider } from "./context/OrderPauseContext.jsx";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./Components/ScrollToTop.jsx";
import "@fontsource/open-sans";
import { CurrencyProvider } from "./context/currencyContext.jsx";
createRoot(document.getElementById("root")).render(
  <AppProvider>
    <OrderPauseProvider>
      <BrowserRouter>
        <ScrollToTop />
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </BrowserRouter>
    </OrderPauseProvider>
  </AppProvider>
);
