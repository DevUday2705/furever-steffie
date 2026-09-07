import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getShiprocketToken, SHIPROCKET_BASE_URL } from "./utils/shiprocketAuth.js";

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

// Fallback weight per outfit when a product has no weight on file (~150-200g per kurta, averaged).
const DEFAULT_ITEM_WEIGHT_KG = 0.2;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    try {
        const { deliveryPincode, items = [], codRequired = false } = req.body;

        if (!deliveryPincode || !/^\d{6}$/.test(String(deliveryPincode))) {
            return res.status(400).json({ message: "Valid 6-digit deliveryPincode is required" });
        }

        const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
        if (!pickupPincode) {
            return res.status(500).json({ message: "SHIPROCKET_PICKUP_PINCODE is not configured" });
        }

        const totalWeight = items.length
            ? items.reduce(
                  (sum, item) => sum + (item.weightKg || DEFAULT_ITEM_WEIGHT_KG) * (item.quantity || 1),
                  0
              )
            : DEFAULT_ITEM_WEIGHT_KG;

        const token = await getShiprocketToken(db);

        const params = new URLSearchParams({
            pickup_postcode: String(pickupPincode),
            delivery_postcode: String(deliveryPincode),
            weight: totalWeight.toFixed(2),
            cod: codRequired ? "1" : "0",
        });

        const resp = await fetch(`${SHIPROCKET_BASE_URL}/courier/serviceability/?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await resp.json();

        if (!resp.ok) {
            console.error("Shiprocket serviceability error:", json);
            return res.status(resp.status).json({ message: "Shiprocket serviceability check failed", error: json });
        }

        const couriers = json?.data?.available_courier_companies || [];

        const options = couriers
            .filter((c) => c.blocked !== 1)
            .map((c) => ({
                courierId: c.courier_company_id,
                courierName: c.courier_name,
                etaDays: c.etd || c.estimated_delivery_days || null,
                price: Math.round(c.rate || 0),
            }))
            .sort((a, b) => a.price - b.price);

        return res.status(200).json({ success: true, options, weightUsedKg: Number(totalWeight.toFixed(2)) });
    } catch (error) {
        console.error("❌ shiprocket-serviceability error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}
