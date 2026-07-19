import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
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

// Helper function to update dhoti inventory
async function updateDhotiInventory(dhotiType, size, quantityToReduce, batch) {
    try {
        const inventoryRef = db.collection('dhotis').doc('inventory');
        const inventorySnap = await getDocWithTimeout(inventoryRef, 5000);
        
        if (!inventorySnap.exists) {
            throw new Error('Dhoti inventory not found');
        }
        
        const currentInventory = inventorySnap.data();
        const currentStock = currentInventory[dhotiType]?.inventory[size] || 0;
        
        if (currentStock < quantityToReduce) {
            throw new Error(`Insufficient dhoti stock. Available: ${currentStock}, Requested: ${quantityToReduce} for ${dhotiType} size ${size}`);
        }
        
        const newStock = currentStock - quantityToReduce;
        
        // Add dhoti inventory update to batch
        batch.update(inventoryRef, {
            [`${dhotiType}.inventory.${size}`]: newStock,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'order-system'
        });
        
        console.log(`📦 Added dhoti inventory update to batch: ${dhotiType} size ${size} - ${currentStock} -> ${newStock}`);
        return true;
    } catch (error) {
        console.error('Error updating dhoti inventory:', error);
        throw error;
    }
}

// Helper to fetch a document with a timeout to avoid long blocking calls
function getDocWithTimeout(docRef, ms = 5000) {
    return Promise.race([
        docRef.get(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore read timeout')), ms))
    ]);
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
            coupon,
            dispatchDate,
            isCollaboration, // Add isCollaboration flag
            customCouponId, // Add custom coupon ID for marking as used
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !customer || !items || !amount) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check and update stock for XS, S, M sizes (parallelized reads)
        const batch = db.batch();
        const stockUpdates = [];
        console.log("📦 Processing items for stock check:", JSON.stringify(items, null, 2));

        const itemsToCheck = items.filter(i => ['XS', 'S', 'M'].includes(i.selectedSize));
        const readTimeoutMs = 8000;
        let readTimeoutOccurred = false;

        // Fire all primary collection reads in parallel
        const readPromises = itemsToCheck.map(item => {
            let collectionName = item.category || item.subcategory || item.type;
            const collectionMap = {
                'kurta': 'kurtas',
                'pathani': 'pathanis',
                'lehenga': 'lehengas',
                'frock': 'frocks',
                'bandana': 'bandanas',
                'bowtie': 'bowties',
                'dhotis': 'dhotiss'
            };
            if (collectionMap[collectionName]) {
                collectionName = collectionMap[collectionName];
            } else if (collectionName && !collectionName.endsWith('s')) {
                collectionName += 's';
            }

            const productRef = db.collection(collectionName).doc(item.productId);
            return getDocWithTimeout(productRef, readTimeoutMs)
                .then(doc => ({ item, doc, productRef, collectionName }))
                .catch(err => ({ item, error: err, productRef, collectionName }));
        });

        const readResults = await Promise.all(readPromises);

        for (const result of readResults) {
            const item = result.item;
            if (result.error) {
                console.error(`❌ Read error for product ${item.productId}:`, result.error.message);
                // If a read timed out, set flag and break to fallback save without stock updates
                if (result.error.message && result.error.message.toLowerCase().includes('timeout')) {
                    readTimeoutOccurred = true;
                    break;
                }
                // For other errors, respond with 500
                return res.status(500).json({ success: false, message: `Error reading product ${item.productId}`, error: result.error.message });
            }

            const productDoc = result.doc;
            const productRef = result.productRef;
            const collectionName = result.collectionName;

            if (!productDoc || !productDoc.exists) {
                console.error(`❌ Product not found in primary collection: ${item.productId} (${collectionName})`);
                // Try alternative collections sequentially
                const alternativeCollections = ['kurtas', 'pathanis', 'lehengas', 'frocks', 'bandanas', 'bowties', 'dhotiss'];
                let found = false;
                for (const altCollection of alternativeCollections) {
                    try {
                        const altRef = db.collection(altCollection).doc(item.productId);
                        const altDoc = await getDocWithTimeout(altRef, readTimeoutMs);
                        if (altDoc && altDoc.exists) {
                            const product = altDoc.data();
                            const currentStock = product.sizeStock?.[item.selectedSize] || 0;
                            const requestedQty = item.quantity || 1;
                            if (currentStock < requestedQty) {
                                return res.status(400).json({ message: `Insufficient stock for size ${item.selectedSize}. Available: ${currentStock}, Requested: ${requestedQty}` });
                            }
                            stockUpdates.push({ ref: altRef, size: item.selectedSize, newStock: currentStock - requestedQty, productId: item.productId, collectionName: altCollection });
                            found = true;
                            break;
                        }
                    } catch (err) {
                        console.log(`Failed to read ${item.productId} from ${altCollection}:`, err.message);
                        if (err.message && err.message.toLowerCase().includes('timeout')) {
                            readTimeoutOccurred = true;
                            break;
                        }
                    }
                }
                if (readTimeoutOccurred) break;
                if (!found) {
                    return res.status(400).json({ message: `Product ${item.productId} not found in any collection` });
                }
            } else {
                const product = productDoc.data();
                const currentStock = product.sizeStock?.[item.selectedSize] || 0;
                const requestedQty = item.quantity || 1;
                if (currentStock < requestedQty) {
                    return res.status(400).json({ message: `Insufficient stock for size ${item.selectedSize}. Available: ${currentStock}, Requested: ${requestedQty}` });
                }
                stockUpdates.push({ ref: productRef, size: item.selectedSize, newStock: currentStock - requestedQty, productId: item.productId, collectionName });
            }
        }

        if (readTimeoutOccurred) {
            console.warn('⚠️ One or more Firestore reads timed out; will save order without stock updates after creating order');
        }

        // Process dhoti inventory for items with dhoti selections
        console.log("🍀 Processing dhoti inventory updates...");
        
        for (const item of items) {
            // Check if item has dhoti selected (isFullSet indicates Kurta + Dhoti, isRoyalSet includes dhoti)
            if ((item.isFullSet || item.isRoyalSet) && item.selectedDhoti) {
                const dhotiQuantity = item.quantity || 1;
                console.log(`🍀 Item requires dhoti: ${item.name}, Dhoti: ${item.selectedDhoti}, Size: ${item.selectedSize}, Qty: ${dhotiQuantity}`);
                
                try {
                    await updateDhotiInventory(item.selectedDhoti, item.selectedSize, dhotiQuantity, batch);
                } catch (error) {
                    console.error(`❌ Dhoti inventory error for ${item.selectedDhoti} size ${item.selectedSize}:`, error.message);
                    return res.status(400).json({
                        message: `Dhoti inventory error: ${error.message}`
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
            paymentStatus: isCollaboration ? "collaboration" : "paid", // Set different payment status for collaboration orders
            orderStatus: "pending",
            createdAt: new Date().toISOString(),
            dispatchDate: dispatchDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now if not provided
            coupon: coupon || null,
            isCollaboration: isCollaboration || false, // Add isCollaboration flag
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

        if (readTimeoutOccurred) {
            console.warn('⚠️ Read timeout detected earlier — saving order without stock updates');
            try {
                const fallbackOrderRef = await db.collection('orders').add(orderData);
                try {
                    const { default: sendOrderConfirmation } = await import('./send-order-confirmation.js');
                    const mockReq = { method: 'POST', body: { orderId: fallbackOrderRef.id, orderNumber, razorpay_order_id, razorpay_payment_id, customer, items, amount } };
                    const mockRes = { status: (code) => ({ json: (data) => data }) };
                    await sendOrderConfirmation(mockReq, mockRes);
                } catch (emailError) {
                    console.error('❌ Email service error on fallback order:', emailError);
                }

                return res.status(200).json({ success: true, orderId: fallbackOrderRef.id, orderNumber, warning: 'Order saved but stock may not be updated due to Firestore read timeout', stockUpdated: [] });
            } catch (fallbackSaveError) {
                console.error('❌ Failed to save fallback order after read timeout:', fallbackSaveError);
                return res.status(500).json({ success: false, message: 'Failed to save order after Firestore read timeout', error: fallbackSaveError.message });
            }
        }

        try {
            // Commit all changes atomically
            await batch.commit();
            console.log(`✅ Batch committed successfully!`);

            // Mark custom coupon as used if provided
            if (customCouponId) {
                try {
                    const customCouponRef = db.collection('customCoupons').doc(customCouponId);
                    await customCouponRef.update({
                        isUsed: true,
                        usedAt: new Date().toISOString(),
                        usedBy: customer.email || customer.fullName,
                        orderId: razorpay_order_id
                    });
                    console.log(`✅ Custom coupon ${customCouponId} marked as used`);
                } catch (couponError) {
                    console.error("❌ Error marking custom coupon as used:", couponError);
                    // Don't fail the order if coupon update fails
                }
            }

            // Send order confirmation email
            try {
                const emailPayload = {
                    orderId: orderRef.id,
                    orderNumber,
                    razorpay_order_id,
                    razorpay_payment_id,
                    customer,
                    items,
                    amount,
                };

                console.log("📧 Sending order confirmation email...");

                // Import and call the email handler directly
                const { default: sendOrderConfirmation } = await import('./send-order-confirmation.js');

                // Create a mock request object for the email handler
                const mockReq = {
                    method: 'POST',
                    body: emailPayload
                };

                const mockRes = {
                    status: (code) => ({
                        json: (data) => {
                            if (code === 200) {
                                console.log("✅ Order confirmation email sent successfully");
                            } else {
                                console.warn("⚠️ Failed to send order confirmation email, but order was saved");
                            }
                            return data;
                        }
                    })
                };

                await sendOrderConfirmation(mockReq, mockRes);
            } catch (emailError) {
                console.error("❌ Email service error:", emailError);
                // Don't fail the order if email fails
            }

            // Send WhatsApp confirmation
            try {
                const whatsappPayload = {
                    customerName: customer.fullName,
                    customerPhone: customer.mobileNumber,
                    orderId: razorpay_order_id,
                    items: items,
                    totalAmount: amount,
                    orderDate: new Date().toISOString()
                };

                console.log("📱 Sending WhatsApp confirmation...");

              
                // Create a mock request object for the WhatsApp handler
                const mockWhatsAppReq = {
                    method: 'POST',
                    body: whatsappPayload
                };

                const mockWhatsAppRes = {
                    status: (code) => ({
                        json: (data) => {
                            if (code === 200) {
                                console.log("✅ WhatsApp confirmation sent successfully");
                            } else {
                                console.warn("⚠️ Failed to send WhatsApp confirmation, but order was saved");
                            }
                            return data;
                        }
                    })
                };

                // await sendWhatsAppConfirmation(mockWhatsAppReq, mockWhatsAppRes);
            } catch (whatsappError) {
                console.error("❌ WhatsApp service error:", whatsappError);
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

                // Send order confirmation email for fallback order too
                try {
                    const emailPayload = {
                        orderId: fallbackOrderRef.id,
                        orderNumber,
                        razorpay_order_id,
                        razorpay_payment_id,
                        customer,
                        items,
                        amount,
                    };

                    console.log("📧 Sending order confirmation email for fallback order...");

                    // Import and call the email handler directly
                    const { default: sendOrderConfirmation } = await import('./send-order-confirmation.js');

                    // Create a mock request object for the email handler
                    const mockReq = {
                        method: 'POST',
                        body: emailPayload
                    };

                    const mockRes = {
                        status: (code) => ({
                            json: (data) => {
                                if (code === 200) {
                                    console.log("✅ Order confirmation email sent successfully");
                                } else {
                                    console.warn("⚠️ Failed to send order confirmation email, but order was saved");
                                }
                                return data;
                            }
                        })
                    };

                    await sendOrderConfirmation(mockReq, mockRes);
                } catch (emailError) {
                    console.error("❌ Email service error:", emailError);
                    // Don't fail the order if email fails
                }

                // Send WhatsApp confirmation for fallback order
                try {
                    const whatsappPayload = {
                        customerName: customer.fullName,
                        customerPhone: customer.mobileNumber,
                        orderId: razorpay_order_id,
                        items: items,
                        totalAmount: amount,
                        orderDate: new Date().toISOString()
                    };

                    console.log("📱 Sending WhatsApp confirmation for fallback order...");

                   

                    // Create a mock request object for the WhatsApp handler
                    const mockWhatsAppReq = {
                        method: 'POST',
                        body: whatsappPayload
                    };

                    const mockWhatsAppRes = {
                        status: (code) => ({
                            json: (data) => {
                                if (code === 200) {
                                    console.log("✅ WhatsApp confirmation sent successfully");
                                } else {
                                    console.warn("⚠️ Failed to send WhatsApp confirmation, but order was saved");
                                }
                                return data;
                            }
                        })
                    };

                    await sendWhatsAppConfirmation(mockWhatsAppReq, mockWhatsAppRes);
                } catch (whatsappError) {
                    console.error("❌ WhatsApp service error:", whatsappError);
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
            error: error.message
        });
    }
}
