import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./Components/ScrollToTop.jsx";

createRoot(document.getElementById("root")).render(
  <AppProvider>
    <BrowserRouter>
      <ScrollToTop />

      <App />
    </BrowserRouter>
  </AppProvider>
);
