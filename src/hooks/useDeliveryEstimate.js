import { useEffect, useState } from "react";

// Standard delivery promise for an Indian pincode: Shiprocket's courier days
// for our best-value courier (see api/shiprocket.js) + 1 to + 2 days buffer.
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
  const days = result.courierDays;
  const by = new Date(Date.now() + (days + 2) * 24 * 60 * 60 * 1000);
  return {
    minDays: days + 1,
    maxDays: days + 2,
    byDate: by.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
    city: result.city || null,
    state: result.state || null,
  };
}
