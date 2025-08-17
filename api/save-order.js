import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// WhatsApp messaging utilities
const MSG91_AUTH_KEY = "464925AYkG1psqH0oB68a22c76P1";

/**
 * Send WhatsApp message using MSG91 API
 */
const sendWhatsAppMessage = async (mobileNumber, message) => {
  try {
    console.log(`📱 Sending WhatsApp to ${mobileNumber}`);
    
    // Format mobile number - ensure it has country code
    let formattedNumber = mobileNumber.replace(/\D/g, ''); // Remove non-digits
    
    // Add country code if not present (assuming India +91)
    if (!formattedNumber.startsWith('91') && formattedNumber.length === 10) {
      formattedNumber = '91' + formattedNumber;
    }
    
    const payload = {
      integrated_number: "918828145667", // Your business WhatsApp number
      content_type: "text",
      payload: {
        text: message
      },
      recipient_whatsapp: formattedNumber
    };

    const response = await fetch("https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok && result.type === 'success') {
      console.log(`✅ WhatsApp sent successfully to ${formattedNumber}`);
      return true;
    } else {
      console.error(`❌ WhatsApp failed:`, result);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ WhatsApp error:`, error);
    return false;
  }
};

/**
 * Generate order confirmation message
 */
const generateOrderConfirmationMessage = (orderData) => {
  const { orderNumber, customer, items, amount } = orderData;
  
  // Get first item for main product details
  const firstItem = items[0];
  const itemCount = items.length;
  
  let message = `🎉 *Order Confirmed!*

Hi ${customer.fullName}! 

Your order has been placed successfully:

📦 *Order #${orderNumber}*
💰 Amount: ₹${amount}
📱 Phone: ${customer.mobileNumber}

🐕 *Product Details:*
• ${firstItem.name}
• Size: ${firstItem.selectedSize}`;

  // Add style information if available
  if (firstItem.selectedStyle && firstItem.selectedStyle !== 'simple') {
    const styleMap = {
      'tassels': 'With Tassels',
      'beaded': 'Beaded Luxe',
      'beaded-tassels': 'Beaded + Tassels'
    };
    message += `\n• Style: ${styleMap[firstItem.selectedStyle] || firstItem.selectedStyle}`;
  }

  // Add set information
  if (firstItem.isFullSet) {
    message += `\n• Full Set: Yes`;
  }
  if (firstItem.isDupattaSet) {
    message += `\n• Dupatta Set: Yes`;
  }
  if (firstItem.selectedDhoti) {
    message += `\n• Dhoti: ${firstItem.selectedDhoti}`;
  }

  if (itemCount > 1) {
    message += `\n\n*+ ${itemCount - 1} more item(s)*`;
  }

  message += `

📏 *IMPORTANT - Next Steps:*

To complete your order, we need your pup's exact measurements:

1️⃣ *Neck Circumference* - Measure around the neck where the collar sits
2️⃣ *Chest Circumference* - Measure around the widest part of the chest  
3️⃣ *Back Length* - Measure from collar to tail

📞 *Please reply with measurements in this format:*
Neck: __cm, Chest: __cm, Back: __cm

Our team will contact you within 24 hours for any clarifications.

Thank you for choosing Furever! 🐾

*Team Furever*
📞 +91 88281 45667`;

  return message;
};

let db;

// Initialize Firestore only once
if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    initializeApp({
        credential: cert({
            ...serviceAccount,
            private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
        }),
    });

    db = getFirestore();
} else {
    db = getFirestore();
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items,
            amount,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !customer || !items || !amount) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check and update stock for XS, S, M sizes
        const batch = db.batch();
        const stockUpdates = [];

        console.log("📦 Processing items for stock check:", JSON.stringify(items, null, 2));

        for (const item of items) {
            console.log(`🔍 Checking item: ${item.name}, Size: ${item.selectedSize}, Category: ${item.category || item.subcategory || item.type}`);

            if (['XS', 'S', 'M'].includes(item.selectedSize)) {
                // Try different collection name patterns
                let collectionName = item.category || item.subcategory || item.type;

                // Handle known collection mappings
                const collectionMap = {
                    'kurta': 'kurtas',
                    'lehenga': 'lehengas',
                    'frock': 'frocks',
                    'bandana': 'bandanas',
                    'bowtie': 'bowties'
                };

                // Use mapped name or add 's' if needed
                if (collectionMap[collectionName]) {
                    collectionName = collectionMap[collectionName];
                } else if (collectionName && !collectionName.endsWith('s')) {
                    collectionName += 's';
                }

                console.log(`📁 Using collection: ${collectionName}, Product ID: ${item.productId}`);

                const productRef = db.collection(collectionName).doc(item.productId);
                const productDoc = await productRef.get();

                if (!productDoc.exists) {
                    console.error(`❌ Product not found: ${item.productId} in collection ${collectionName}`);

                    // Try alternative collection names
                    const alternativeCollections = ['kurtas', 'lehengas', 'frocks', 'bandanas', 'bowties'];
                    let found = false;

                    for (const altCollection of alternativeCollections) {
                        try {
                            const altRef = db.collection(altCollection).doc(item.productId);
                            const altDoc = await altRef.get();

                            if (altDoc.exists) {
                                console.log(`✅ Found product in alternative collection: ${altCollection}`);
                                const product = altDoc.data();
                                const currentStock = product.sizeStock?.[item.selectedSize] || 0;
                                const requestedQty = item.quantity || 1;

                                console.log(`📋 Stock check - Size: ${item.selectedSize}, Current: ${currentStock}, Requested: ${requestedQty}`);

                                if (currentStock < requestedQty) {
                                    return res.status(400).json({
                                        message: `Insufficient stock for size ${item.selectedSize}. Available: ${currentStock}, Requested: ${requestedQty}`
                                    });
                                }

                                stockUpdates.push({
                                    ref: altRef,
                                    size: item.selectedSize,
                                    newStock: currentStock - requestedQty,
                                    productId: item.productId,
                                    collectionName: altCollection
                                });

                                found = true;
                                break;
                            }
                        } catch (err) {
                            console.log(`Failed to check collection ${altCollection}:`, err.message);
                        }
                    }

                    if (!found) {
                        return res.status(400).json({
                            message: `Product ${item.productId} not found in any collection`
                        });
                    }
                } else {
                    const product = productDoc.data();
                    console.log(`📊 Product data:`, JSON.stringify(product.sizeStock, null, 2));

                    const currentStock = product.sizeStock?.[item.selectedSize] || 0;
                    const requestedQty = item.quantity || 1;

                    console.log(`📋 Stock check - Size: ${item.selectedSize}, Current: ${currentStock}, Requested: ${requestedQty}`);

                    if (currentStock < requestedQty) {
                        return res.status(400).json({
                            message: `Insufficient stock for size ${item.selectedSize}. Available: ${currentStock}, Requested: ${requestedQty}`
                        });
                    }

                    // Prepare stock update
                    stockUpdates.push({
                        ref: productRef,
                        size: item.selectedSize,
                        newStock: currentStock - requestedQty,
                        productId: item.productId,
                        collectionName: collectionName
                    });
                }
            }
        }

        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

        const orderData = {
            orderNumber,
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items, // Should contain: productId, name, selectedSize, price, quantity, etc.
            amount,
            orderSource: items.length > 1 ? "cart" : "buy-now",
            paymentStatus: "paid",
            orderStatus: "pending",
            createdAt: new Date().toISOString(),
        };

        console.log(`🔄 Creating order with number: ${orderNumber}`);
        console.log(`📋 Order data:`, JSON.stringify(orderData, null, 2));

        // Save order and update stock in a batch
        const orderRef = db.collection("orders").doc();
        batch.set(orderRef, orderData);

        console.log(`💾 Added order to batch with ID: ${orderRef.id}`);

        // Add stock updates to batch
        for (const update of stockUpdates) {
            console.log(`📦 Adding stock update to batch: ${update.productId} - ${update.size} -> ${update.newStock}`);
            batch.update(update.ref, {
                [`sizeStock.${update.size}`]: update.newStock
            });
        }

        console.log(`🚀 Committing batch with ${stockUpdates.length} stock updates...`);

        try {
            // Commit all changes atomically
            await batch.commit();
            console.log(`✅ Batch committed successfully!`);

            // Send WhatsApp confirmation message
            try {
                const confirmationMessage = generateOrderConfirmationMessage(orderData);
                const whatsappSent = await sendWhatsAppMessage(customer.mobileNumber, confirmationMessage);
                console.log(`📱 WhatsApp message ${whatsappSent ? 'sent' : 'failed'} to ${customer.mobileNumber}`);
            } catch (whatsappError) {
                console.error("❌ WhatsApp sending failed:", whatsappError);
                // Don't fail the order if WhatsApp fails
            }

            return res.status(200).json({
                success: true,
                orderId: orderRef.id,
                orderNumber,
                stockUpdated: stockUpdates.map(u => ({
                    productId: u.productId,
                    size: u.size,
                    newStock: u.newStock,
                    collection: u.collectionName
                }))
            });
        } catch (batchError) {
            console.error("❌ Batch commit failed:", batchError);

            // Try to save order without stock update as fallback
            try {
                console.log("🔄 Attempting to save order without stock update...");
                const fallbackOrderRef = await db.collection("orders").add(orderData);

                // Send WhatsApp confirmation message for fallback order too
                try {
                    const confirmationMessage = generateOrderConfirmationMessage(orderData);
                    const whatsappSent = await sendWhatsAppMessage(customer.mobileNumber, confirmationMessage);
                    console.log(`📱 WhatsApp message ${whatsappSent ? 'sent' : 'failed'} to ${customer.mobileNumber}`);
                } catch (whatsappError) {
                    console.error("❌ WhatsApp sending failed:", whatsappError);
                    // Don't fail the order if WhatsApp fails
                }

                return res.status(200).json({
                    success: true,
                    orderId: fallbackOrderRef.id,
                    orderNumber,
                    warning: "Order saved but stock may not be updated",
                    stockUpdated: []
                });
            } catch (fallbackError) {
                console.error("❌ Fallback order save also failed:", fallbackError);
                throw fallbackError;
            }
        }
    } catch (error) {
        console.error("❌ Failed to save order to Firestore:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while saving order",
        });
    }
}
