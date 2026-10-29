import { useEffect, useState } from "react";
import { nextDispatch, formatDaysFromToday } from "../utils/dispatchSchedule";

// Standard delivery promise for an Indian pincode, counted from our real
// next dispatch day (10 PM cutoff, no Sunday pickup - see dispatchSchedule):
// dispatch + Shiprocket's courier days for our best-value courier (see
// api/shiprocket.js, counted from pickup) + 1 day buffer for courier slips.
// The range's upper end covers the ~20% of orders that dispatch a day late.
const BUFFER_DAYS = 1;
const LATE_DISPATCH_DAYS = 1;

// Returns null when there's nothing to show (no/invalid pincode, or
// Shiprocket couldn't answer - callers fall back to a generic range),
// { loading: true } while fetching, else { minDays, maxDays, byDate, city, state }.
export function useDeliveryEstimate(pincode) {
  const valid = /^\d{6}$/.test(pincode || "") ? pincode : null;
  // Keyed by pincode so a stale answer for a previous pincode is never shown.
  const [result, setResult] = useState(null); // { pincode, courierDays, city, state }

  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    fetch(`/api/shiprocket?action=delivery-estimate&pincode=${valid}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setResult(
          data?.serviceable
            ? { pincode: valid, courierDays: data.courierDays, city: data.city, state: data.state }
            : { pincode: valid, courierDays: null }
        );
      })
      .catch(() => {
        if (!cancelled) setResult({ pincode: valid, courierDays: null });
      });
    return () => {
      cancelled = true;
    };
  }, [valid]);

  if (!valid) return null;
  if (result?.pincode !== valid) return { loading: true };
  if (!result.courierDays) return null;
  const minDays = nextDispatch().daysFromToday + result.courierDays + BUFFER_DAYS;
  const maxDays = minDays + LATE_DISPATCH_DAYS;
  return {
    minDays,
    maxDays,
    byDate: formatDaysFromToday(maxDays),
    city: result.city || null,
    state: result.state || null,
  };
}
