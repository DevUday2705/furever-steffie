import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { waitUntil } from "@vercel/functions";
import {
  getShiprocketToken,
  SHIPROCKET_BASE_URL,
} from "../lib/shiprocketAuth.js";
import { sendShippedNotificationWhatsApp } from "../lib/whatsappNotify.js";
import { requireAdmin } from "../lib/adminAuth.js";

// Creating a shipment is 2-3 sequential Shiprocket API calls plus Firestore
// I/O - comfortably over Vercel's default 10s limit if Shiprocket is even
// slightly slow, which is exactly what caused FUNCTION_INVOCATION_TIMEOUT
// during bulk shipping. Hobby plan supports up to 60s when configured.
export const config = {
  maxDuration: 60,
};

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({
    credential: cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();

const DEFAULT_ITEM_WEIGHT_KG = 0.1;
const DEFAULT_DIMENSIONS_CM = { length: 21, breadth: 26, height: 2 };

async function shiprocketFetch(path, token, options = {}) {
  const doFetch = (t) =>
    fetch(`${SHIPROCKET_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
        ...(options.headers || {}),
      },
    });
  let resp = await doFetch(token);
  if (resp.status === 401) {
    resp = await doFetch(await getShiprocketToken(db, true));
  }
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const err = new Error(
      json?.message || `Shiprocket request failed: ${resp.status}`,
    );
    err.status = resp.status;
    err.body = json;
    throw err;
  }
  return json;
}

// Best-value courier rule (how we pick by hand in Shiprocket):
//  - ignore poorly rated couriers (< MIN_COURIER_RATING) when a decent one exists
//  - take the cheapest of the rest as the baseline
//  - a pricier courier is only worth it if it's faster AND costs at most
//    max(₹15, 25%) more - e.g. India Post ₹50 vs Blue Dart ₹60 a day sooner
//    -> Blue Dart; but ₹90-100 for the same speed -> no.
// Among couriers inside that budget: fastest, then cheapest, then best rated.
const MIN_COURIER_RATING = 3.5;
const PREMIUM_FLAT = 15;
const PREMIUM_PERCENT = 0.25;

function pickBestCourier(options) {
  if (!options.length) return null;
  const rated = options.filter((o) => (o.rating ?? 0) >= MIN_COURIER_RATING);
  const pool = rated.length ? rated : options;
  const cheapest = Math.min(...pool.map((o) => o.price));
  const budget = cheapest + Math.max(PREMIUM_FLAT, cheapest * PREMIUM_PERCENT);
  const days = (o) => o.etaDays ?? Infinity;
  return pool
    .filter((o) => o.price <= budget)
    .sort((a, b) => days(a) - days(b) || a.price - b.price || (b.rating ?? 0) - (a.rating ?? 0))[0];
}

// Shiprocket's courier list -> our options, the best-value pick first
// (marked recommended) and the rest cheapest-first. Bulk ship and the ship
// modal both default to options[0].
function rankCouriers(couriers) {
  const options = couriers
    .filter((c) => c.blocked !== 1)
    .map((c) => ({
      courierId: c.courier_company_id,
      courierName: c.courier_name,
      // estimated_delivery_days is a day count ("3"); etd is a date string
      etaDays: Number(c.estimated_delivery_days) || null,
      etaDate: c.etd || null,
      price: Math.round(c.rate || 0),
      rating: c.rating || null,
    }))
    .sort((a, b) => a.price - b.price);
  const best = pickBestCourier(options);
  if (!best) return options;
  return [{ ...best, recommended: true }, ...options.filter((o) => o !== best)];
}

async function fetchServiceability(token, params) {
  const url = `${SHIPROCKET_BASE_URL}/courier/serviceability/?${params.toString()}`;
  let resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (resp.status === 401) {
    // Cached token was rejected ("Invalid Token") - re-login and retry once
    const fresh = await getShiprocketToken(db, true);
    resp = await fetch(url, { headers: { Authorization: `Bearer ${fresh}` } });
  }
  return resp;
}

// Public (no admin sign-in): checkout shows "delivery in N days" once the
// customer types a pincode. Only the courier days of our best-value pick go
// out - never prices or courier names. GET so Vercel's CDN caches it per
// pincode and repeat visitors don't each hit Shiprocket.
async function handleDeliveryEstimate(req, res) {
  const pincode = String(req.query.pincode || "");
  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ message: "Valid 6-digit pincode is required" });
  }
  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickupPincode) {
    return res.status(500).json({ message: "SHIPROCKET_PICKUP_PINCODE is not configured" });
  }
  try {
    const params = new URLSearchParams({
      pickup_postcode: String(pickupPincode),
      delivery_postcode: pincode,
      weight: DEFAULT_ITEM_WEIGHT_KG.toFixed(2),
      cod: "0",
    });
    const token = await getShiprocketToken(db);
    const [resp, place] = await Promise.all([
      fetchServiceability(token, params),
      // Clean city/state for the pincode. The courier rows carry a city too,
      // but it's whatever the courier calls its hub ("VFS-VISA FACILATION
      // SERV" for 110001) - only used as a fallback.
      shiprocketFetch(`/open/postcode/details?postcode=${pincode}`, token)
        .then((j) => j?.postcode_details || null)
        .catch(() => null),
    ]);
    const json = await resp.json().catch(() => ({}));
    const couriers = resp.ok ? json?.data?.available_courier_companies || [] : [];
    const best = rankCouriers(couriers)[0];

    if (!best?.etaDays) {
      res.setHeader("Cache-Control", "s-maxage=3600");
      return res.status(200).json({ success: true, serviceable: false });
    }
    // Shown on the product page ("Delivering to Pune, Maharashtra") and
    // used to pre-fill checkout.
    const city = place?.city || couriers[0].city || null;
    const state = place?.state || couriers[0].state || null;
    res.setHeader("Cache-Control", "s-maxage=43200, stale-while-revalidate=86400");
    return res.status(200).json({ success: true, serviceable: true, courierDays: best.etaDays, city, state });
  } catch (error) {
    console.error("❌ shiprocket delivery-estimate error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function handleServiceability(req, res) {
  try {
    const { deliveryPincode, items = [], codRequired = false } = req.body;

    if (!deliveryPincode || !/^\d{6}$/.test(String(deliveryPincode))) {
      return res
        .status(400)
        .json({ message: "Valid 6-digit deliveryPincode is required" });
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
    if (!pickupPincode) {
      return res
        .status(500)
        .json({ message: "SHIPROCKET_PICKUP_PINCODE is not configured" });
    }

    const totalWeight = items.length
      ? items.reduce(
          (sum, item) =>
            sum +
            (item.weightKg || DEFAULT_ITEM_WEIGHT_KG) * (item.quantity || 1),
          0,
        )
      : DEFAULT_ITEM_WEIGHT_KG;

    const token = await getShiprocketToken(db);

    const params = new URLSearchParams({
      pickup_postcode: String(pickupPincode),
      delivery_postcode: String(deliveryPincode),
      weight: totalWeight.toFixed(2),
      cod: codRequired ? "1" : "0",
    });

    const resp = await fetchServiceability(token, params);
    const text = await resp.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text.trim() };
    }

    if (!resp.ok) {
      console.error("Shiprocket serviceability error:", json);
      return res
        .status(resp.status)
        .json({
          message: "Shiprocket serviceability check failed",
          error: json,
        });
    }

    const options = rankCouriers(json?.data?.available_courier_companies || []);

    return res
      .status(200)
      .json({
        success: true,
        options,
        weightUsedKg: Number(totalWeight.toFixed(2)),
      });
  } catch (error) {
    console.error("❌ shiprocket serviceability error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

async function handleCreateOrder(req, res) {
  try {
    const { orderId, courierId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION_NAME;
    if (!pickupLocation) {
      return res
        .status(500)
        .json({ message: "SHIPROCKET_PICKUP_LOCATION_NAME is not configured" });
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      return res.status(404).json({ message: "Order not found" });
    }
    const order = orderSnap.data();
    const customer = order.customer || {};

    // Idempotency: if a previous attempt got far enough to record a
    // shipment (e.g. it succeeded on Shiprocket's side but our function
    // was killed by a timeout before writing that back), don't create a
    // second shipment and burn wallet balance on a duplicate - just
    // return what's already there.
    if (order.shiprocketShipmentId) {
      console.log(
        `ℹ️ Order ${orderId} already has a Shiprocket shipment (${order.shiprocketShipmentId}), skipping duplicate creation`,
      );
      return res.status(200).json({
        success: true,
        trackingId: order.tracking_id,
        courierName: order.courierPartner,
        shiprocketOrderId: order.shiprocketOrderId,
        shipmentId: order.shiprocketShipmentId,
        alreadyShipped: true,
      });
    }

    const totalWeight =
      (order.items || []).reduce(
        (sum, item) =>
          sum +
          (item.weightKg || DEFAULT_ITEM_WEIGHT_KG) * (item.quantity || 1),
        0,
      ) || DEFAULT_ITEM_WEIGHT_KG;

    const token = await getShiprocketToken(db);

    const isCod = order.paymentMethod === "cod";
    // For a hybrid COD order the customer already paid the advance online -
    // the courier should only collect the remaining balance at the door.
    const collectibleAmount = isCod
      ? order.codAmountDue || 0
      : order.amount || 0;

    const createPayload = {
      order_id: order.orderNumber,
      order_date: (order.createdAt || new Date().toISOString())
        .slice(0, 19)
        .replace("T", " "),
      pickup_location: pickupLocation,
      billing_customer_name: customer.fullName || "Customer",
      billing_last_name: "",
      billing_address: customer.addressLine1 || "",
      billing_address_2: customer.addressLine2 || "",
      billing_city: customer.city || "",
      billing_pincode: customer.pincode || "",
      billing_state: customer.state || "",
      billing_country: "India",
      billing_email: customer.email || "",
      billing_phone: customer.mobileNumber || "",
      shipping_is_billing: true,
      order_items: (order.items || []).map((item, index, items) => {
        // Shiprocket rejects duplicate SKUs within one order, which happens when
        // the same product is ordered in several sizes. Include the size, and
        // fall back to the line index if it's still not unique.
        const baseSku = [item.productId || item.name || "SKU", item.selectedSize]
          .filter(Boolean)
          .join("-");
        const isDuplicate = items.some(
          (other, otherIndex) =>
            otherIndex < index &&
            [other.productId || other.name || "SKU", other.selectedSize]
              .filter(Boolean)
              .join("-") === baseSku,
        );
        return {
          name: item.name || "Kurta",
          sku: isDuplicate ? `${baseSku}-${index + 1}` : baseSku,
          units: item.quantity || 1,
          selling_price: item.price || 0,
        };
      }),
      payment_method: isCod ? "COD" : "Prepaid",
      sub_total: collectibleAmount,
      length: DEFAULT_DIMENSIONS_CM.length,
      breadth: DEFAULT_DIMENSIONS_CM.breadth,
      height: DEFAULT_DIMENSIONS_CM.height,
      weight: Number(totalWeight.toFixed(2)),
    };

    const createResult = await shiprocketFetch("/orders/create/adhoc", token, {
      method: "POST",
      body: JSON.stringify(createPayload),
    });

    const shipmentId = createResult.shipment_id;
    const shiprocketOrderId = createResult.order_id;
    if (!shipmentId) {
      console.error(
        "Shiprocket order create returned no shipment_id:",
        createResult,
      );
      return res
        .status(502)
        .json({
          message: "Shiprocket did not return a shipment_id",
          details: createResult,
        });
    }

    let awbResult;
    try {
      awbResult = await shiprocketFetch("/courier/assign/awb", token, {
        method: "POST",
        body: JSON.stringify(
          courierId
            ? { shipment_id: shipmentId, courier_id: courierId }
            : { shipment_id: shipmentId },
        ),
      });
    } catch (awbError) {
      // Courier lists go stale fast - Shiprocket's real-time "stressed
      // courier" filtering can drop the courier we fetched moments ago
      // by the time we actually try to book it. Fall back to letting
      // Shiprocket auto-assign instead of failing the whole shipment.
      const notServiceable =
        courierId && /not serviceable/i.test(awbError.body?.message || "");
      if (!notServiceable) throw awbError;

      console.warn(
        `⚠️ Courier ${courierId} no longer serviceable for shipment ${shipmentId}, retrying with auto-assign`,
      );
      awbResult = await shiprocketFetch("/courier/assign/awb", token, {
        method: "POST",
        body: JSON.stringify({ shipment_id: shipmentId }),
      });
    }

    const awbData = awbResult?.response?.data;
    const awbCode = awbData?.awb_code;
    const courierName = awbData?.courier_name;

    if (!awbCode) {
      console.error(
        "Shiprocket AWB assignment returned no awb_code:",
        awbResult,
      );
      return res
        .status(502)
        .json({
          message: "Shiprocket did not return an AWB code",
          details: awbResult,
        });
    }

    // Best-effort and not needed before responding - runs in the
    // background so it can't push this request over the timeout.
    waitUntil(
      shiprocketFetch("/courier/generate/pickup", token, {
        method: "POST",
        body: JSON.stringify({ shipment_id: [shipmentId] }),
      }).catch((pickupError) => {
        console.error(
          "⚠️ Shiprocket pickup scheduling failed:",
          pickupError.body || pickupError.message,
        );
      }),
    );

    const updateData = {
      // Booked, not yet handed over - the admin moves it to "shipped" by
      // hand once it's actually picked up.
      orderStatus: "shipping-booked",
      tracking_id: awbCode,
      courierPartner: courierName,
      shiprocketOrderId,
      shiprocketShipmentId: shipmentId,
      processed: false,
    };
    await orderRef.update(updateData);

    try {
      const { default: sendShippedNotification } =
        await import("./send-shipped-notification.js");
      const mockReq = {
        method: "POST",
        body: {
          customerName: customer.fullName || "",
          customerEmail: customer.email || customer.mobileNumber || "",
          orderId,
          trackingId: awbCode,
          expectedDelivery: "",
          customerCity: customer.city || "",
          courierPartner: courierName,
          shippingType: "standard",
          items: order.items || [],
          trackingUrl: `https://shiprocket.co/tracking/${awbCode}`,
        },
      };
      const mockRes = { status: (code) => ({ json: (data) => data }) };
      await sendShippedNotification(mockReq, mockRes);
    } catch (emailError) {
      console.error(
        "❌ Failed to send shipped notification email:",
        emailError,
      );
    }

    try {
      await sendShippedNotificationWhatsApp({
        phone: customer.mobileNumber,
        customerName: customer.fullName || "",
        orderNumber: order.orderNumber,
        courierName,
        trackingId: awbCode,
      });
    } catch (whatsappError) {
      console.error(
        "❌ Failed to send shipped notification WhatsApp:",
        whatsappError,
      );
    }

    return res.status(200).json({
      success: true,
      trackingId: awbCode,
      courierName,
      shiprocketOrderId,
      shipmentId,
    });
  } catch (error) {
    console.error(
      "❌ shiprocket create-order error:",
      error.body || error.message,
    );
    return res.status(error.status || 500).json({
      success: false,
      message: "Failed to create Shiprocket shipment",
      error: error.body || error.message,
    });
  }
}

// Shiprocket merges every shipment id passed in into a single label PDF -
// this is what makes bulk printing possible (one link covering the whole
// batch, one page per shipment).
async function fetchLabelUrl(token, shipmentIds) {
  const result = await shiprocketFetch("/courier/generate/label", token, {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
  if (!result.label_url)
    throw new Error("Shiprocket did not return a label_url");
  return result.label_url;
}

async function handleGenerateLabels(req, res) {
  try {
    const { shipmentIds } = req.body;
    if (!Array.isArray(shipmentIds) || !shipmentIds.length) {
      return res.status(400).json({ message: "shipmentIds array is required" });
    }
    const token = await getShiprocketToken(db);
    const labelUrl = await fetchLabelUrl(token, shipmentIds);
    return res.status(200).json({ success: true, labelUrl });
  } catch (error) {
    console.error(
      "❌ shiprocket generate-labels error:",
      error.body || error.message,
    );
    return res.status(error.status || 500).json({
      success: false,
      message: "Failed to generate labels",
      error: error.body || error.message,
    });
  }
}

export default async function handler(req, res) {
  if (req.method === "GET" && req.query.action === "delivery-estimate") {
    return handleDeliveryEstimate(req, res);
  }
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST method allowed" });
  }

  // Every POST action is staff-only (shipments cost money).
  if (!(await requireAdmin(req, res))) return;

  const { action } = req.body;

  if (action === "serviceability") {
    return handleServiceability(req, res);
  } else if (action === "create-order") {
    return handleCreateOrder(req, res);
  } else if (action === "generate-labels") {
    return handleGenerateLabels(req, res);
  } else {
    return res.status(400).json({
      message:
        "action must be 'serviceability', 'create-order', or 'generate-labels'",
    });
  }
}
