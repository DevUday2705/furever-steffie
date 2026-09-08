import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getShiprocketToken, SHIPROCKET_BASE_URL } from "../lib/shiprocketAuth.js";
import { sendShippedNotificationWhatsApp } from "../lib/whatsappNotify.js";

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

const DEFAULT_ITEM_WEIGHT_KG = 0.2;
const DEFAULT_DIMENSIONS_CM = { length: 21, breadth: 26, height: 2 };

async function shiprocketFetch(path, token, options = {}) {
    const resp = await fetch(`${SHIPROCKET_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
        const err = new Error(json?.message || `Shiprocket request failed: ${resp.status}`);
        err.status = resp.status;
        err.body = json;
        throw err;
    }
    return json;
}

async function handleServiceability(req, res) {
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
                rating: c.rating || null,
            }))
            .sort((a, b) => a.price - b.price);

        return res.status(200).json({ success: true, options, weightUsedKg: Number(totalWeight.toFixed(2)) });
    } catch (error) {
        console.error("❌ shiprocket serviceability error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
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
            return res.status(500).json({ message: "SHIPROCKET_PICKUP_LOCATION_NAME is not configured" });
        }

        const orderRef = db.collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) {
            return res.status(404).json({ message: "Order not found" });
        }
        const order = orderSnap.data();
        const customer = order.customer || {};

        const totalWeight = (order.items || []).reduce(
            (sum, item) => sum + (item.weightKg || DEFAULT_ITEM_WEIGHT_KG) * (item.quantity || 1),
            0
        ) || DEFAULT_ITEM_WEIGHT_KG;

        const token = await getShiprocketToken(db);

        const isCod = order.paymentMethod === "cod";
        // For a hybrid COD order the customer already paid the advance online -
        // the courier should only collect the remaining balance at the door.
        const collectibleAmount = isCod ? (order.codAmountDue || 0) : (order.amount || 0);

        const createPayload = {
            order_id: order.orderNumber,
            order_date: (order.createdAt || new Date().toISOString()).slice(0, 19).replace("T", " "),
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
            order_items: (order.items || []).map((item) => ({
                name: item.name || "Kurta",
                sku: item.productId || item.name || "SKU",
                units: item.quantity || 1,
                selling_price: item.price || 0,
            })),
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
            console.error("Shiprocket order create returned no shipment_id:", createResult);
            return res.status(502).json({ message: "Shiprocket did not return a shipment_id", details: createResult });
        }

        const awbPayload = courierId ? { shipment_id: shipmentId, courier_id: courierId } : { shipment_id: shipmentId };
        const awbResult = await shiprocketFetch("/courier/assign/awb", token, {
            method: "POST",
            body: JSON.stringify(awbPayload),
        });

        const awbData = awbResult?.response?.data;
        const awbCode = awbData?.awb_code;
        const courierName = awbData?.courier_name;

        if (!awbCode) {
            console.error("Shiprocket AWB assignment returned no awb_code:", awbResult);
            return res.status(502).json({ message: "Shiprocket did not return an AWB code", details: awbResult });
        }

        try {
            await shiprocketFetch("/courier/generate/pickup", token, {
                method: "POST",
                body: JSON.stringify({ shipment_id: [shipmentId] }),
            });
        } catch (pickupError) {
            console.error("⚠️ Shiprocket pickup scheduling failed (continuing):", pickupError.body || pickupError.message);
        }

        const updateData = {
            orderStatus: "shipped",
            tracking_id: awbCode,
            courierPartner: courierName,
            shiprocketOrderId,
            shiprocketShipmentId: shipmentId,
        };
        await orderRef.update(updateData);

        try {
            const { default: sendShippedNotification } = await import("./send-shipped-notification.js");
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
            console.error("❌ Failed to send shipped notification email:", emailError);
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
            console.error("❌ Failed to send shipped notification WhatsApp:", whatsappError);
        }

        return res.status(200).json({
            success: true,
            trackingId: awbCode,
            courierName,
            shiprocketOrderId,
            shipmentId,
        });
    } catch (error) {
        console.error("❌ shiprocket create-order error:", error.body || error.message);
        return res.status(error.status || 500).json({
            success: false,
            message: "Failed to create Shiprocket shipment",
            error: error.body || error.message,
        });
    }
}

async function handleGenerateLabels(req, res) {
    try {
        const { shipmentIds } = req.body;
        if (!Array.isArray(shipmentIds) || !shipmentIds.length) {
            return res.status(400).json({ message: "shipmentIds array is required" });
        }

        const token = await getShiprocketToken(db);
        // Shiprocket merges all requested shipments into a single label PDF -
        // this is what makes bulk printing possible (one link, print once).
        const result = await shiprocketFetch("/courier/generate/label", token, {
            method: "POST",
            body: JSON.stringify({ shipment_id: shipmentIds }),
        });

        if (!result.label_url) {
            return res.status(502).json({ message: "Shiprocket did not return a label_url", details: result });
        }

        return res.status(200).json({ success: true, labelUrl: result.label_url });
    } catch (error) {
        console.error("❌ shiprocket generate-labels error:", error.body || error.message);
        return res.status(error.status || 500).json({
            success: false,
            message: "Failed to generate labels",
            error: error.body || error.message,
        });
    }
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    const { action } = req.body;

    if (action === "serviceability") {
        return handleServiceability(req, res);
    } else if (action === "create-order") {
        return handleCreateOrder(req, res);
    } else if (action === "generate-labels") {
        return handleGenerateLabels(req, res);
    } else {
        return res.status(400).json({ message: "action must be 'serviceability', 'create-order', or 'generate-labels'" });
    }
}
