import { useContext, useState } from "react";
import { MapPin, Truck, Zap } from "lucide-react";
import { CurrencyContext } from "../../context/currencyContext";
import { useDeliveryEstimate } from "../../hooks/useDeliveryEstimate";
import { EXPRESS_DELIVERY_TEXT, loadSavedPincode, savePincode } from "../../constants/shipping";

// "Check delivery" on the product page: pincode -> area plus Standard
// (Shiprocket estimate) and Express delivery times. Prices are left to
// checkout. India only - international shipping is quoted at checkout.
const DeliveryCheck = () => {
  const { currency } = useContext(CurrencyContext);
  const [pincode, setPincode] = useState(loadSavedPincode);
  const estimate = useDeliveryEstimate(pincode);

  if (currency !== "INR") return null;

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(value);
    if (value.length === 6) savePincode(value);
  };

  return (
    <div className="mt-5 border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
        <MapPin size={16} /> Check delivery
      </h3>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="postal-code"
        value={pincode}
        onChange={handleChange}
        placeholder="Enter 6-digit pincode"
        className="mt-2 w-full p-2 border border-gray-300 rounded-md text-sm"
      />

      {pincode.length === 6 && (
        <div className="mt-3 space-y-2.5">
          {estimate?.city && (
            <p className="text-xs text-gray-700">
              Delivering to{" "}
              <span className="font-semibold">
                {estimate.city}
                {estimate.state && `, ${estimate.state}`}
              </span>
            </p>
          )}
          <div className="flex items-start gap-2.5">
            <Truck size={18} className="text-green-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-gray-800">Standard</span>
              <span className="block text-xs text-gray-600">
                {estimate?.loading
                  ? "Checking delivery time…"
                  : estimate
                    ? `Delivery in ${estimate.minDays}-${estimate.maxDays} days (by ${estimate.byDate})`
                    : "7-10 working days"}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Zap size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-gray-800">Express</span>
              <span className="block text-xs text-gray-600">
                {EXPRESS_DELIVERY_TEXT}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryCheck;
